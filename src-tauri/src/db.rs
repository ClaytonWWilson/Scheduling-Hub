use diesel::{connection::SimpleConnection, migration};
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

    let mut conn: SqliteConnection = SqliteConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url));

    // HACK: Couldn't find an easier way to enable foreign keys
    conn.batch_execute("PRAGMA foreign_keys = ON")
        // diesel::sql_query("PRAGMA foreign_keys = ON").get_result(&mut conn);
        .unwrap_or_else(|_| panic!("Could not enable foreign keys in SQLite"));

    return conn;
}

pub fn run_migrations(connection: &mut SqliteConnection) -> migration::Result<()> {
    connection.run_pending_migrations(MIGRATIONS)?;
    Ok(())
}

#[tauri::command]
pub fn insert_station(station_code: &str) -> () {
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

#[tauri::command]
pub fn insert_same_day_task(
    station_code: &str,
    start_time: &str,
    tba_submitted_count: Option<i32>,
    dpo_complete_time: &str,
    end_time: &str,
    same_day_type: &str,
    buffer_percent: i32,
    dpo_link: &str,
    tba_routed_count: i32,
    route_count: i32,
) -> Result<String, String> {
    use crate::models::NewSameDayTask;
    use crate::schema::same_day_route_task;

    let new_task: NewSameDayTask<'_> = NewSameDayTask {
        station_code,
        start_time,
        tba_submitted_count,
        dpo_complete_time,
        end_time,
        same_day_type,
        buffer_percent,
        dpo_link,
        tba_routed_count,
        route_count,
    };

    let mut conn: SqliteConnection = establish_connection();

    let insert_result: std::result::Result<usize, diesel::result::Error> =
        diesel::insert_into(same_day_route_task::table)
            .values(&new_task)
            .execute(&mut conn);

    match insert_result {
        Ok(num_inserted) => {
            let message = format!(
                "Inserted {} lines into same_day_route_task table.",
                num_inserted
            );
            println!("{}", message);
            return Ok(message);
        }
        Err(err) => {
            let message = err.to_string();
            println!("{}", message);
            return Err(message);
        }
    }
}

#[tauri::command]
pub fn insert_lmcp_task(
    station_code: &str,
    ofd_date: &str,
    ead: &str,
    current_lmcp: i32,
    current_atrops: i32,
    pdr: i32,
    requested: i32,
    sim_link: &str,
    value: i32,
    start_time: Option<&str>,
    export_time: Option<&str>,
    end_time: Option<&str>,
    source: &str,
    namespace: &str,
    type_: &str,
    wave_group_name: &str,
    ship_option_category: &str,
    address_type: &str,
    package_type: &str,
    cluster: &str,
    fulfillment_network_type: &str,
    volume_type: &str,
    week: i32,
    f: &str,
) -> Result<String, String> {
    use crate::models::NewLMCPTask;
    use crate::schema::lmcp_task;

    let new_lmcp_task: NewLMCPTask<'_> = NewLMCPTask {
        station_code,
        ofd_date,
        ead,
        current_lmcp,
        current_atrops,
        pdr,
        requested,
        sim_link,
        value,
        start_time,
        export_time,
        end_time,
        source,
        namespace,
        type_,
        wave_group_name,
        ship_option_category,
        address_type,
        package_type,
        cluster,
        fulfillment_network_type,
        volume_type,
        week,
        f,
    };

    let mut conn: SqliteConnection = establish_connection();

    let insert_result: std::result::Result<usize, diesel::result::Error> =
        diesel::insert_into(lmcp_task::table)
            .values(&new_lmcp_task)
            .execute(&mut conn);

    match insert_result {
        Ok(num_inserted) => {
            let message = format!("Inserted {} lines into lmcp_task table.", num_inserted);
            println!("{}", message);
            return Ok(message);
        }
        Err(err) => {
            let message = err.to_string();
            println!("{}", message);
            return Err(message);
        }
    }
}
