class OpenDataResource1 < ActiveResource::Base
  self.include_root_in_json = false

  class << self

    def get_all(param)
      @result = get(param)
    end

    def select(dataset, param)
      query = "$select=#{param}"
      @result = get(dataset, from: query)
      self
    end
  end
end