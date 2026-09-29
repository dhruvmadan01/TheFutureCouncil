-- Ensure teamed_up_at is always set when both sides confirm, even for service role / admin updates

create or replace function public.guard_connection_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- Always auto-populate teamed_up_at when both sides agree
  if new.teamed_up_from and new.teamed_up_to and old.teamed_up_at is null then
    new.teamed_up_at := now();
  end if;

  if auth.uid() is null or public.is_admin() then return new; end if;

  -- immutable fields
  new.from_id := old.from_id; new.to_id := old.to_id; new.note := old.note; new.created_at := old.created_at;
  if new.status is distinct from old.status then
    if old.status = 'pending' and new.status in ('accepted', 'declined') and auth.uid() = old.to_id then
      new.responded_at := now();
    elsif old.status = 'accepted' and new.status = 'archived' then
      null;
    elsif old.status = 'pending' and new.status = 'archived' and auth.uid() = old.from_id then
      null; -- sender withdraws
    else
      raise exception 'Not allowed.' using errcode = 'P0001';
    end if;
  end if;
  if auth.uid() = old.from_id then new.teamed_up_to := old.teamed_up_to; end if;
  if auth.uid() = old.to_id   then new.teamed_up_from := old.teamed_up_from; end if;
  if new.status <> 'accepted' then
    new.teamed_up_from := old.teamed_up_from; new.teamed_up_to := old.teamed_up_to;
  end if;
  return new;
end $$;
