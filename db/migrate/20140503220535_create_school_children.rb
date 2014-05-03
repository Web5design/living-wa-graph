class CreateSchoolChildren < ActiveRecord::Migration
  def change
    create_table :school_children do |t|

      t.timestamps
    end
  end
end
