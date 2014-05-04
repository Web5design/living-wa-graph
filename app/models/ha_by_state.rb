class HaByState < ActiveResource::Base
  self.site = 'http://opendata.socrata.com/'
  self.element_name = "resource"

  def self.get_all
    __get_all
  end

private
  def self.__get_all(param=nil)
    if(param.nil?)
      get("ncud-8fmy")
    else
      get("ncud-8fmy?#{param}")
    end
  end
end
