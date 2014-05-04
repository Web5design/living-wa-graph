# Static datasets scraped from Socrata for testing the homeless mapping project
class HomelessStat < ActiveResource::Base
  # scrape metadata:
  # url: http://opendata.socrata.com/resource/k6e5-w7dp
  # date: 2014-04-04 00:14
  def self.families_with_minors
    File.read("#{Rails.root}/app/models/datasets/families_with_minors.json")
  end
end
