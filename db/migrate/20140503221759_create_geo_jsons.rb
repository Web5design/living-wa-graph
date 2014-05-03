class CreateGeoJsons < ActiveRecord::Migration
  def change
    create_table :geo_jsons do |t|

      t.timestamps
    end
  end
end
