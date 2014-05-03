class MapController < ApplicationController
    def fake_map
    	render json: GeoJson.map
    end
end
