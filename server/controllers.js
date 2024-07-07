require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.HOST,
  user: process.env.USER,
  database: process.env.DATABASE,
  password: process.env.PW,
  authType: 'scram-sha-256'
  port: 5432,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 0
});

module.exports = {
  getReviews: (req, res) => {
    pool.query(`
    SELECT json_build_object(
      'product', ${req.params.product_id},
      'results',
      (SELECT json_agg(json_build_object(
        'review_id', review_id,
        'rating', rating,
        'summary', summary,
        'recommend', recommend,
        'response', response,
        'body', body,
        'date', date,
        'reviewer_name', reviewer_name,
        'helpfulness', helpfulness,
        'photos',
        (SELECT json_agg(json_build_object(
          'id', photos.photo_id,
          'url', photos.url))
          FROM photos
          WHERE photos.review_id = reviews.review_id)
      ))
      FROM reviews
      WHERE product_id = ${req.params.product_id}
      )
    )
    `)
      .then((query) => res.status(200).send(query.rows[0].json_build_object))
      .catch((err) => res.send(err));
  },

  getMetaData: (req, res) => {
    pool.query(
      `SELECT json_build_object(
    'product_id', ${req.params.product_id}::text,
    'ratings', json_build_object(
        '1', (SELECT COUNT(*)::text FROM reviews WHERE rating = 1 AND product_id = ${req.params.product_id}),
        '2', (SELECT COUNT(*)::text FROM reviews WHERE rating = 2 AND product_id = ${req.params.product_id}),
        '3', (SELECT COUNT(*)::text FROM reviews WHERE rating = 3 AND product_id = ${req.params.product_id}),
        '4', (SELECT COUNT(*) FROM reviews WHERE rating = 4 AND product_id = ${req.params.product_id}),
        '5', (SELECT COUNT(*)::text FROM reviews WHERE rating = 5 AND product_id = ${req.params.product_id})
    ),
    'recommended', json_build_object(
        'false', (SELECT COUNT(*)::text FROM reviews WHERE recommend = false AND product_id = ${req.params.product_id}),
        'true', (SELECT COUNT(*)::text FROM reviews WHERE recommend = true AND product_id = ${req.params.product_id})
    ),
    'characteristics', json_build_object(
        'Size', json_build_object(
            'id', (SELECT characteristic_id FROM characteristics WHERE name = 'Size' AND product_id = ${req.params.product_id}),
            'value', (SELECT AVG(value)::text FROM rev_characteristics JOIN characteristics ON rev_characteristics.characteristic_id = characteristics.characteristic_id WHERE product_id = ${req.params.product_id} AND name = 'Size')
        ),
        'Width', json_build_object(
            'id', (SELECT characteristic_id FROM characteristics WHERE name = 'Width' AND product_id = ${req.params.product_id}),
            'value', (SELECT AVG(value)::text FROM rev_characteristics JOIN characteristics ON rev_characteristics.characteristic_id = characteristics.characteristic_id WHERE product_id = ${req.params.product_id} AND name = 'Width')
        ),
        'Fit', json_build_object(
            'id', (SELECT characteristic_id FROM characteristics WHERE name = 'Fit' AND product_id = ${req.params.product_id}),
            'value', (SELECT AVG(value)::text FROM rev_characteristics JOIN characteristics ON rev_characteristics.characteristic_id = characteristics.characteristic_id WHERE product_id = ${req.params.product_id} AND name = 'Fit')
        ),
        'Length', json_build_object(
            'id', (SELECT characteristic_id FROM characteristics WHERE name = 'Length' AND product_id = ${req.params.product_id}),
            'value', (SELECT AVG(value)::text FROM rev_characteristics JOIN characteristics ON rev_characteristics.characteristic_id = characteristics.characteristic_id WHERE product_id = ${req.params.product_id} AND name = 'Length')
        ),
        'Comfort', json_build_object(
            'id', (SELECT characteristic_id FROM characteristics WHERE name = 'Comfort' AND product_id = ${req.params.product_id}),
            'value', (SELECT AVG(value)::text FROM rev_characteristics JOIN characteristics ON rev_characteristics.characteristic_id = characteristics.characteristic_id WHERE product_id = ${req.params.product_id} AND name = 'Comfort')
        ),
        'Quality', json_build_object(
            'id', (SELECT characteristic_id FROM characteristics WHERE name = 'Quality' AND product_id = ${req.params.product_id}),
            'value', (SELECT AVG(value)::text FROM rev_characteristics JOIN characteristics ON rev_characteristics.characteristic_id = characteristics.characteristic_id WHERE product_id = ${req.params.product_id} AND name = 'Quality')
        )
    )
) AS metadata`,
    )
      .then((query) => (res.status(200).send(query.rows[0].json_build_object)))
      .catch((err) => (res.send(err)));
  },

  addReview: (req, res) => {
    const date = new Date().toISOString();
    const queryString = 'INSERT INTO reviews (product_id, reviewer_name, reviewer_email, rating, summary, recommend, reported, response, body, date, helpfulness) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)';
    const params = [
      req.params.product_id,
      req.body.reviewer_name,
      req.body.reviewer_email,
      req.body.rating,
      req.body.summary,
      req.body.recommend,
      false,
      req.body.response,
      req.body.body,
      date,
      0,
    ];
    pool.query(queryString, params)
      .then(() => res.status(201).send('CREATED'))
      .catch((err) => res.send(err));
  }
};