DROP DATABASE IF EXISTS reviewsdb;

CREATE DATABASE reviewsdb;

\c reviewsdb;

CREATE TABLE reviews (
  review_id int,
  product_id int,
  rating int,
  summary text,
  recommend boolean,
  response text NULL,
  reported boolean,
  body text,
  date bigint,
  reviewer_name text,
  reviewer_email text,
  helpfulness int,
  PRIMARY KEY(review_id)
);

COPY reviews(review_id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness) FROM '/Users/karb1ne/RFP2404/SDC-Reviews/reviews.csv'
DELIMITER ','
CSV HEADER
(review_id, product_id, rating,
date to_char(to_timestamp(date/1000.0), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness);

CREATE INDEX reviews_product_id_index
ON reviews (product_id);

CREATE INDEX ratings_index
ON reviews (rating);

CREATE TABLE photos (
  photo_id int,
  review_id int,
  url text,
  PRIMARY KEY (photo_id),
  FOREIGN KEY (review_id) REFERENCES reviews(review_id)
);

COPY photos(photo_id, review_id, url) FROM '/Users/karb1ne/RFP2404/SDC-Reviews/reviews_photos.csv'
DELIMITER ','
CSV HEADER

CREATE INDEX photos_review_id_index
ON photos (review_id);

CREATE TABLE characteristics (
  characteristic_id int,
  product_id int,
  name text,
  PRIMARY KEY (characteristic_id)
);

COPY photos(photo_id, review_id, url) FROM '/Users/karb1ne/RFP2404/SDC-Reviews/characteristics.csv'
DELIMITER ','
CSV HEADER;

CREATE INDEX characteristics_product_id
ON characteristics (product_id);

CREATE TABLE rev_characteristics (
  rev_char_id int,
  characteristic_id int,
  review_id int,
  value int,
  PRIMARY KEY (rev_char_id),
  FOREIGN KEY (characteristic_id) REFERENCES characteristics(characteristic_id),
  FOREIGN KEY (review_id) REFERENCES reviews(review_id)
);

COPY rev_characteristics(rev_char_id, characteristic_id, review_id, value) FROM '/Users/karb1ne/RFP2404/SDC-Reviews/characteristic_reviews.csv'
DELIMITER ','
CSV HEADER;

CREATE INDEX rev_characteristics_characteristic_id
ON rev_characteristics (characteristic_id);
