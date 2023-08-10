// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
pub mod models;
pub mod schema;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

fn main() {
    let mut conn: diesel::SqliteConnection = db::establish_connection();
    match db::run_migrations(&mut conn) {
        Ok(()) => (),
        Err(err) => {
            println!("{}", err);
            panic!("Failed to run database migrations");
        }
    };

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            db::insert_station,
            db::get_stations,
            db::delete_station,
            db::insert_same_day_task,
            db::insert_lmcp_task
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
