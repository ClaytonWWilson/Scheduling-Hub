// @generated automatically by Diesel CLI.

diesel::table! {
    same_day_route_task (id) {
        id -> Integer,
        routing_type -> Text,
        station_code -> Text,
        start_time -> Date,
        tba_submitted_count -> Integer,
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

diesel::allow_tables_to_appear_in_same_query!(
    same_day_route_task,
    station,
);
