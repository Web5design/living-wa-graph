class SchoolLocations < ActiveResource::Base
  self.site = 'http://data.seattle.gov/'
  self.element_name = "resource"

  def self.get_all
    __get_all
  end

private
  def self.__get_all(param=nil)
    if(param.nil?)
      get("pmap-kbvr")
    else
      get("pmap-kbvr?#{param}")
    end
  end
end
