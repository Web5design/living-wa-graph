class MapController < ApplicationController
    def fake_map
        @geojson = {}
         respond_to do |format|
            format.json { @geojson.to_json }
        end
    end
end
