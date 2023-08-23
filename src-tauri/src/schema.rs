// @generated automatically by Diesel CLI.

diesel::table! {
    lmcp_task (id) {
        id -> Integer,
        station_code -> Text,
        ofd_date -> Text,
        ead -> Text,
        current_lmcp -> Integer,
        current_atrops -> Integer,
        pdr -> Integer,
        requested -> Integer,
        sim_link -> Text,
        value -> Integer,
        start_time -> Nullable<Date>,
        export_time -> Nullable<Date>,
        end_time -> Nullable<Date>,
        source -> Text,
        namespace -> Text,
        #[sql_name = "type"]
        type_ -> Text,
        wave_group_name -> Text,
        ship_option_category -> Text,
        address_type -> Text,
        package_type -> Text,
        cluster -> Text,
        fulfillment_network_type -> Text,
        volume_type -> Text,
        week -> Integer,
        f -> Text,
    }
}

diesel::table! {
    same_day_route_task (id) {
        id -> Integer,
        station_code -> Text,
        start_time -> Nullable<Date>,
        tba_submitted_count -> Nullable<Integer>,
        dpo_complete_time -> Nullable<Date>,
        end_time -> Nullable<Date>,
        same_day_type -> Text,
        buffer_percent -> Integer,
        dpo_link -> Text,
        tba_routed_count -> Integer,
        route_count -> Integer,
    }
}

diesel::table! {
    station (station_code) {
        station_code -> Text,
    }
}

diesel::joinable!(lmcp_task -> station (station_code));
diesel::joinable!(same_day_route_task -> station (station_code));

diesel::allow_tables_to_appear_in_same_query!(
    lmcp_task,
    same_day_route_task,
    station,
);
