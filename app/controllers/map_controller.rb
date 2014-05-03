class MapController < ApplicationController
	def fake_map
		 respond_to |format| do
		 	@product = {
		 		hello: "world"
		 	}
            format.json {resp.to_json}
            format.js
        end
	end
end
