from geopy.geocoders import GoogleV3


class GeoPyService:
    def __init__(self, api_key: str):
        self.geolocator = GoogleV3(api_key=api_key)

    def get_location_coordinates(self, components: dict) -> tuple[float, float]:
        new_components = {k: v for k, v in components.items() if v is not None}
        location = self.geolocator.geocode(", ".join(new_components.values()))
        if location is None:
            return 0.0, 0.0
        return location.latitude, location.longitude
