create table if not EXISTS new_same_day_route_task (
  id integer not null primary key,
  station_code text not null,
  start_time date,
  tba_submitted_count integer,
  dpo_complete_time date,
  end_time date,
  same_day_type text not null,
  buffer_percent integer not null,
  dpo_link text not null,
  tba_routed_count integer not null,
  route_count integer not null,
  foreign key(station_code) references station (station_code)
);

INSERT into new_same_day_route_task(id, station_code, start_time, tba_submitted_count, dpo_complete_time, end_time, same_day_type, buffer_percent, dpo_link, tba_routed_count, route_count) 
SELECT id, station_code, start_time, tba_submitted_count, dpo_complete_time, end_time, same_day_type, buffer_percent, dpo_link, tba_routed_count, route_count
FROM same_day_route_task;

drop TABLE same_day_route_task;

ALTER TABLE new_same_day_route_task RENAME to same_day_route_task;