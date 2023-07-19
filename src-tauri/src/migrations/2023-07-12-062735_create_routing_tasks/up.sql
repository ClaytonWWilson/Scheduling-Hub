create table station (
  station_code text not null primary key
);

create table same_day_route_task (
  id integer not null primary key,
  station_code text not null,
  start_time date not null,
  tba_submitted_count integer,
  dpo_complete_time date not null,
  end_time date not null,
  same_day_type text not null,
  buffer_percent integer not null,
  dpo_link text not null,
  tba_routed_count integer not null,
  route_count integer not null,
  foreign key(station_code) references station (station_code)
);

-- create table amxl_route_task (
--   id integer not null primary key,
--   station_code text not null,
--   foreign key (station_code) references stations (station_code)
-- );
