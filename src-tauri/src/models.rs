use super::schema;
use diesel::prelude::*;
use serde::Serialize;

#[derive(Queryable, Selectable, Serialize)]
#[serde(rename_all = "camelCase")]
#[diesel(table_name = schema::station)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Station {
    pub station_code: String,
}

#[derive(Insertable)]
#[diesel(table_name = schema::station)]
pub struct NewStation<'a> {
    pub station_code: &'a str,
}

#[derive(Queryable, Selectable, Serialize)]
#[serde(rename_all = "camelCase")]
#[diesel(table_name = schema::same_day_route_task)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct SameDayTask {
    pub id: i32,
    pub station_code: String,
    pub start_time: Option<String>,
    pub tba_submitted_count: Option<i32>,
    pub dpo_complete_time: Option<String>,
    pub end_time: Option<String>,
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

#[derive(Queryable, Selectable, Serialize)]
#[serde(rename_all = "camelCase")]
#[diesel(table_name = schema::lmcp_task)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct LMCPTask {
    pub id: i32,
    pub station_code: String,
    pub ofd_date: String,
    pub ead: String,
    pub current_lmcp: i32,
    pub current_atrops: i32,
    pub pdr: i32,
    pub requested: i32,
    pub sim_link: String,
    pub value: i32,
    pub start_time: Option<String>,
    pub export_time: Option<String>,
    pub end_time: Option<String>,
    pub source: String,
    pub namespace: String,
    pub type_: String,
    pub wave_group_name: String,
    pub ship_option_category: String,
    pub address_type: String,
    pub package_type: String,
    pub cluster: String,
    pub fulfillment_network_type: String,
    pub volume_type: String,
    pub week: i32,
    pub f: String,
}

#[derive(Insertable)]
#[diesel(table_name = schema::lmcp_task)]
pub struct NewLMCPTask<'a> {
    pub station_code: &'a str,
    pub ofd_date: &'a str,
    pub ead: &'a str,
    pub current_lmcp: i32,
    pub current_atrops: i32,
    pub pdr: i32,
    pub requested: i32,
    pub sim_link: &'a str,
    pub value: i32,
    pub start_time: Option<&'a str>,
    pub export_time: Option<&'a str>,
    pub end_time: Option<&'a str>,
    pub source: &'a str,
    pub namespace: &'a str,
    pub type_: &'a str,
    pub wave_group_name: &'a str,
    pub ship_option_category: &'a str,
    pub address_type: &'a str,
    pub package_type: &'a str,
    pub cluster: &'a str,
    pub fulfillment_network_type: &'a str,
    pub volume_type: &'a str,
    pub week: i32,
    pub f: &'a str,
}
