// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
pub mod models;
pub mod schema;

use lazy_static::lazy_static;
use std::fs;
use std::sync::Mutex;

lazy_static! {
    static ref DATABASE_URL: Mutex<String> = Mutex::new(String::from(""));
}

fn mk_dir(dir: &str) -> () {
    // Create dir if it does not exist
    if !fs::metadata(dir).is_ok() {
        fs::create_dir_all(dir).unwrap_or_else(|error| {
            panic!("Failed to create directory: {:?}", error);
        });
    }
}

fn main() {
    // tauri::Builder::default()
    //     .invoke_handler(tauri::generate_handler![
    //         db::insert_station,
    //         db::get_stations,
    //         db::delete_station,
    //         db::insert_same_day_task,
    //         db::insert_lmcp_task
    //     ])
    //     .run(tauri::generate_context!())
    //     .expect("error while running tauri application");

    let mut app_builder = tauri::Builder::default();

    app_builder = app_builder.invoke_handler(tauri::generate_handler![
        db::insert_station,
        db::get_stations,
        db::delete_station,
        db::insert_same_day_task,
        db::get_all_same_day_tasks,
        db::insert_lmcp_task,
        db::get_all_lmcp_tasks
    ]);

    let app = app_builder
        .build(tauri::generate_context!())
        .expect("Error happend");

    let conf = app.config();
    let mut path = tauri::api::path::app_data_dir(&conf).expect("No path");

    mk_dir(path.to_str().expect("Couldn't get app directory"));
    path.extend(["database.db"]);

    {
        let mut database_url = DATABASE_URL
            .lock()
            .expect("Couldn't get lock on DATABASE_URL");
        *database_url = String::from(path.to_str().unwrap());
    }

    let mut conn: diesel::SqliteConnection = db::establish_connection();
    match db::run_migrations(&mut conn) {
        Ok(()) => (),
        Err(err) => {
            println!("{}", err);
            panic!("Failed to run database migrations");
        }
    };

    app.run(|_app_handle, event| match event {
        tauri::RunEvent::ExitRequested { .. } => {}
        _ => {}
    });
}
