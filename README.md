#API DOCUMENTATION

##User shelves
###GET names of all of a user's shelves
Based off Goodreads' [shelves.list](https://www.goodreads.com/api#shelves.list)
Params:
- key: Developer key (required)
- id: Goodreads user id (required)
- page: Page of results; 1-N (optional; default 1)
  - [note: it appears that goodreads returns the full number of shelves and that the page parameter is irrelevant]

###POST new shelf
Based off Goodreads' [user_shelves.create](https://www.goodreads.com/api#user_shelves.create)   

Params:
- key: Developer key (required)
- id: Goodreads user id (required)
- name: Name of the new shelf (required)
- exclusive_flag: Whether shelf should be exclusive, i.e. books on this shelf cannot be on other shelves; 'true' or 'false' (optional; default 'false')
- sortable_flag: Whether to enable shelf sorting; 'true' or 'false' (optional; default 'false')
- featured: Whether to feature the shelf at the top of profile; 'true' or 'false' (optional; default 'false')


##Books on single shelf
###GET books from single shelf
Based off Goodreads' [reviews.list](https://www.goodreads.com/api#reviews.list)

Params:
- key: Developer key (required)
- id: Goodreads user id (required)
- shelf: Name of shelf (required)
- sort: Whether and how to sort results; title, author, cover, rating, year_pub, date_pub, date_pub_edition, date_started, date_read, date_updated, date_added, recommender, avg_rating, num_ratings, review, read_count, votes, random, comments, notes, isbn, isbn13, asin, num_pages, format, position, shelves, owned, date_purchased, purchase_location, condition (optional)
- query: Query text to match against member's books (optional)
- order: Whether and how to order results; a (ascending), d (descending) (optional, default a)
- page: Page of results; 1-N (optional)
- per_page: Results listed per page; 1-200 (optional)

###POST books to shelf
Based off Goodreads' [shelves.add_to_shelf](https://www.goodreads.com/api#shelves.add_to_shelf)

Params:
- key: Developer key (required)
- id: Goodreads user id (required)
- name: Name of the shelf (required)
- book_id: Goodreads book_id (required)


##Book reviews by ISBN
###GET reviews of a book based on its ISBN
####Return iframe of reviews or actual reviews
Based off Goodreads' [book.show_by_isbn](https://www.goodreads.com/api#book.show_by_isbn)

Params:
- key: Developer key (required)
- isbn: The ISBN of the book to lookup (required)
- rating: Show only reviews with a particular rating (optional)


###POST review of a book based on its ISBN
Based off Goodreads' [review.create](https://www.goodreads.com/api#review.create)

Params:
- key: Developer key (required)
- id: Goodreads user id (required)
- book_id: Goodreads book_id (required)
- review: Text of the review (optional)
- rating: Rating to assign to book; 0-5 (optional, default is 0 (No rating))
- read_at: Date when book was read; YYYY-MM-DD format, e.g. 2008-02-01 (optional)


##Book search by author, title, or ISBN
###GET search results of books by author, title, or ISBN
Based off Goodreads' [search.books](https://www.goodreads.com/api#search.books)

Params:
- key: Developer key (required)
- q: The query text to match against book title, author, and ISBN fields. Supports boolean operators and phrase searching. (required)
- page: Which page to return; 1-N (optional, default 1)
- field: Field to search; title, author, genre, or all (optional, default all)





