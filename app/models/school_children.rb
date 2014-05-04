class SchoolChildren < ActiveResource::Base
  self.site = 'http://opendata.socrata.com/'
  self.element_name = "resource"

# 3ngx-mw5p
  def self.get_all
    get("3ngx-mw5p")
  end
end
