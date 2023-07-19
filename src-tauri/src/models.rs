use super::schema;
use diesel::prelude::*;
use serde::ser::{Serialize, SerializeStruct, Serializer};

#[derive(Queryable, Selectable)]
#[diesel(table_name = schema::station)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Station {
    pub station_code: String,
}

impl Serialize for Station {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut state: <S as Serializer>::SerializeStruct =
            serializer.serialize_struct("Station", 1)?;
        state.serialize_field("station_code", &self.station_code)?;
        state.end()
    }
}

#[derive(Insertable)]
#[diesel(table_name = schema::station)]
pub struct NewStation<'a> {
    pub station_code: &'a str,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = schema::same_day_route_task)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct SameDayTask {
    pub id: i32,
    pub station_code: String,
    pub start_time: String,
    pub tba_submitted_count: Option<i32>,
    pub dpo_complete_time: String,
    pub end_time: String,
    pub same_day_type: String,
    pub buffer_percent: i32,
    pub dpo_link: String,
    pub tba_routed_count: i32,
    pub route_count: i32,
}

#[derive(Insertable)]
#[diesel(table_name = schema::same_day_route_task)]
pub struct NewSameDayTask<'a> {
    pub station_code: &'a str,
    pub start_time: &'a str,
    pub tba_submitted_count: Option<i32>,
    pub dpo_complete_time: &'a str,
    pub end_time: &'a str,
    pub same_day_type: &'a str,
    pub buffer_percent: i32,
    pub dpo_link: &'a str,
    pub tba_routed_count: i32,
    pub route_count: i32,
}
