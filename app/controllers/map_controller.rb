class MapController < ApplicationController
    def map
        render json: GeoJson.map
    end

    def states
        render json: GeoJson.states
    end

    def counties
        render json: GeoJson.counties
    end

    def WAlegislative_districts
        render json: GeoJson.legislative_districts
    end

    def WAschool_districts
        render json: GeoJson.school_districts
    end
end
