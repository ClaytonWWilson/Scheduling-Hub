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
        state.serialize_field("stationCode", &self.station_code)?;
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

impl Serialize for SameDayTask {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut state: <S as Serializer>::SerializeStruct =
            serializer.serialize_struct("SameDayTask", 11)?;
        state.serialize_field("id", &self.id)?;
        state.serialize_field("station_code", &self.station_code)?;
        state.serialize_field("startTime", &self.start_time)?;
        state.serialize_field("tbaSubmittedCount", &self.tba_submitted_count)?;
        state.serialize_field("dpoCompleteTime", &self.dpo_complete_time)?;
        state.serialize_field("endTime", &self.end_time)?;
        state.serialize_field("SameDayType", &self.same_day_type)?;
        state.serialize_field("BufferPercent", &self.buffer_percent)?;
        state.serialize_field("dpoLink", &self.dpo_link)?;
        state.serialize_field("tbaRoutedCount", &self.tba_routed_count)?;
        state.serialize_field("RouteCount", &self.route_count)?;
        state.end()
    }
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

#[derive(Queryable, Selectable)]
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

impl Serialize for LMCPTask {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut state: <S as Serializer>::SerializeStruct =
            serializer.serialize_struct("LMCPTask", 25)?;
        state.serialize_field("id", &self.id)?;
        state.serialize_field("stationCode", &self.station_code)?;
        state.serialize_field("ofdDate", &self.ofd_date)?;
        state.serialize_field("ead", &self.ead)?;
        state.serialize_field("currentLmcp", &self.current_lmcp)?;
        state.serialize_field("currentAtrops", &self.current_atrops)?;
        state.serialize_field("pdr", &self.pdr)?;
        state.serialize_field("requested", &self.requested)?;
        state.serialize_field("simLink", &self.sim_link)?;
        state.serialize_field("value", &self.value)?;
        state.serialize_field("startTime", &self.start_time)?;
        state.serialize_field("exportTime", &self.export_time)?;
        state.serialize_field("endTime", &self.end_time)?;
        state.serialize_field("source", &self.source)?;
        state.serialize_field("namespace", &self.namespace)?;
        state.serialize_field("type", &self.type_)?;
        state.serialize_field("waveGroupName", &self.wave_group_name)?;
        state.serialize_field("shipOptionCategory", &self.ship_option_category)?;
        state.serialize_field("addressType", &self.address_type)?;
        state.serialize_field("packageType", &self.package_type)?;
        state.serialize_field("cluster", &self.cluster)?;
        state.serialize_field("fulfillmentNetworkType", &self.fulfillment_network_type)?;
        state.serialize_field("volumeType", &self.volume_type)?;
        state.serialize_field("week", &self.week)?;
        state.serialize_field("f", &self.f)?;
        state.end()
    }
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
