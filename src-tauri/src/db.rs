use diesel::migration::Result;
// // #[database("diesel")]
use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;
use dotenvy::dotenv;
use std::env;

use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("src/migrations");

pub fn establish_connection() -> SqliteConnection {
    dotenv().ok();

    let database_url: String =
        env::var("CONNECTION_DATABASE_URL").expect("DATABASE_URL must be set");
    SqliteConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
}

pub fn run_migrations(connection: &mut SqliteConnection) -> Result<()> {
    connection.run_pending_migrations(MIGRATIONS)?;
    Ok(())
}

#[tauri::command]
pub fn add_station(station_code: &str) -> () {
    use crate::models::NewStation;
    use crate::schema::station;

    let new_station: NewStation<'_> = NewStation { station_code };

    let mut conn: SqliteConnection = establish_connection();

    let insert_result = diesel::insert_into(station::table)
        .values(&new_station)
        .execute(&mut conn);

    match insert_result {
        Ok(num_inserted) => println!("Inserted {} lines into station table.", num_inserted),
        Err(err) => println!("{}", err),
    }
}

#[tauri::command]
pub fn get_stations() -> String {
    use crate::models::Station;
    use crate::schema::station::dsl::*;

    let mut conn: SqliteConnection = establish_connection();

    let results: Vec<Station> = station
        .select(Station::as_select())
        .load(&mut conn)
        .expect("Error loading stations.");

    let json_results: String =
        serde_json::to_string(&results).expect("Could not parse select Station into json string.");

    return json_results;
}

#[tauri::command]
pub fn delete_station(delete_station_code: &str) -> () {
    use crate::schema::station::dsl::*;

    let mut conn: SqliteConnection = establish_connection();

    let delete_statement = diesel::delete(station.filter(station_code.eq(delete_station_code)));
    let delete_result = delete_statement.execute(&mut conn);

    match delete_result {
        Ok(num_deleted) => println!("{}", num_deleted),
        Err(err) => println!("{}", err),
    }
}
