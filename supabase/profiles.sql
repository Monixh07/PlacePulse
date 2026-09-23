create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  username text not null unique,
  email text,
  role text not null default 'normal'
    check (role in ('normal', 'creator', 'business', 'admin', 'developer')),
  phone text default '',
  bio text default '',
  profile_image text default '',
  followers integer not null default 0,
  following integer not null default 0,
  creator_score integer not null default 0,
  earnings numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Authenticated users can read profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can create their own profile"
  on public.profiles for insert
  to authenticated
  with check (
    id = auth.uid()
    and role in ('normal', 'creator', 'business')
  );

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role in ('normal', 'creator', 'business')
  );

create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role
    and current_setting('request.jwt.claim.role', true) <> 'service_role' then
    raise exception 'Profile roles can only be changed by a trusted server process';
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_change on public.profiles;

create trigger profiles_prevent_role_change
before update on public.profiles
for each row execute function public.prevent_profile_role_change();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text := coalesce(new.raw_user_meta_data ->> 'role', 'normal');
begin
  if requested_role not in ('normal', 'creator', 'business') then
    requested_role := 'normal';
  end if;

  insert into public.profiles (
    id,
    name,
    username,
    email,
    role,
    phone,
    bio,
    profile_image,
    creator_score
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', 'User'),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'username', ''),
      split_part(new.email, '@', 1)
    ),
    new.email,
    requested_role,
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'bio', ''),
    coalesce(new.raw_user_meta_data ->> 'profileImage', ''),
    case when requested_role = 'creator' then 75 else 0 end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
