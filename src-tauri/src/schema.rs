// @generated automatically by Diesel CLI.

diesel::table! {
    lmcp_task (id) {
        id -> Integer,
        station_code -> Text,
        start_time -> Date,
        export_time -> Date,
        end_time -> Date,
        source -> Text,
        namespace -> Text,
        #[sql_name = "type"]
        type_ -> Text,
        wave_group_name -> Text,
        ship_option_category -> Text,
        address_type -> Text,
        package_type -> Text,
        ofd_date -> Text,
        ead -> Text,
        cluster -> Text,
        fulfillment_network_type -> Text,
        volume_type -> Text,
        week -> Integer,
        f -> Text,
        value -> Integer,
        requested -> Integer,
        current_lmcp -> Integer,
        current_atrops -> Integer,
        pdr -> Integer,
        sim_link -> Text,
    }
}

diesel::table! {
    same_day_route_task (id) {
        id -> Integer,
        station_code -> Text,
        start_time -> Date,
        tba_submitted_count -> Nullable<Integer>,
        dpo_complete_time -> Date,
        end_time -> Date,
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
