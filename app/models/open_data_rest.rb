class OpenDataRest

  def self.get(url=nil)
    response = RestClient.get url

    return response.body if response.code == 200

  end
end