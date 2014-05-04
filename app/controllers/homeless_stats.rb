class HomelessStatsController < ApplicationController
  def familes_with_minors
    render json: HomelessStats.familes_with_minors
  end

end
