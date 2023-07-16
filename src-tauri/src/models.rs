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
