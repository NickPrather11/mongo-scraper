# mongo-scraper

Deployed here: https://stark-tor-89874.herokuapp.com/

This node application scrapes The Hard Times website for articles listed in the main section of their homepage and stores them in a Mongo database.

Click "Scrape Articles" to load articles in the All Articles section. This process takes a few seconds (and should probably be updated with a loading progress icon/animation).

Click on the headline to create a note for the article. Notes can be deleted.

Click "Save" under the headline to save the article. This removes the article from "All Articles" and places it in the "Saved Articles" section.

Once articles are in the "Saved Articles" section, you can click "Unsave", removing the article from that section. The article will now show again in the "All Articles" section.

Click "Clear All" to empty the "All Articles" section. This does not delete your saved articles.
