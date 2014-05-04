class SchoolChildren < OpenDataRest
  @@site = 'http://opendata.socrata.com/resource/3ngx-mw5p.json'

  class << self

    def regions
      query = "#{@@site}?$select=regions"
      get query
    end

    def homeless_count_statewide
      query = "#{@@site}?$select=sum(homeless_totals)"
      JSON.parse(get(query))[0]["sum_homeless_totals"]
    end

  end
end
