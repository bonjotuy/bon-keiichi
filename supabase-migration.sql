alter table tasks add column if not exists type text not null default 'task';
alter table tasks add column if not exists due_date date;
