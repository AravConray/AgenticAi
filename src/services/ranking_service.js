"use strict";

// RankingService provides CRUD and utility operations for user rankings.
// It relies on a SQL database exposed via a Knex instance defined in `../db`.

const db = require('../db');

class RankingService {
  constructor() {
    this.table = 'rankings';
  }

  /**
   * Retrieve the top N rankings.
   * @param {number} limit - The maximum number of records to return.
   * @returns {Promise<Array>} Resolves to an array of ranking rows.
   */
  async getTopRankings(limit = 10) {
    try {
      const rows = await db(this.table)
        .select('*')
        .orderBy('score', 'desc')
        .limit(limit);
      return rows;
    } catch (err) {
      console.error('Error fetching top rankings:', err);
      throw err;
    }
  }

  /**
   * Retrieve a specific user's ranking information.
   * @param {string|number} userId - The ID of the user.
   * @returns {Promise<Object|null>} Resolves to the ranking row or null if not found.
   */
  async getUserRanking(userId) {
    try {
      const row = await db(this.table)
        .where({ user_id: userId })
        .first();
      return row || null;
    } catch (err) {
      console.error('Error fetching user ranking for user', userId, ':', err);
      throw err;
    }
  }

  /**
   * Update a user's score and automatically adjust the ranking positions.
   * @param {string|number} userId - The ID of the user.
   * @param {number} newScore - The new score value.
   * @returns {Promise<void>}
   */
  async updateUserScore(userId, newScore) {
    const trx = await db.transaction();
    try {
      // Update the user's score.
      await trx(this.table)
        .where({ user_id: userId })
        .update({ score: newScore, updated_at: db.raw('CURRENT_TIMESTAMP') });

      // Recalculate ranking positions.
      const rows = await trx(this.table).select('user_id', 'score').orderBy('score', 'desc');
      const updates = rows.map((row, index) => {
        const rank = index + 1;
        return trx(this.table)
          .where({ user_id: row.user_id })
          .update({ rank, updated_at: db.raw('CURRENT_TIMESTAMP') });
      });

      await Promise.all(updates);
      await trx.commit();
    } catch (err) {
      await trx.rollback();
      console.error('Error updating user score for user', userId, ':', err);
      throw err;
    }
  }

  /**
   * Recalculate ranking for all users. Useful after bulk data modifications.
   * @returns {Promise<void>}
   */
  async recalculateAllRankings() {
    const trx = await db.transaction();
    try {
      const rows = await trx(this.table).select('user_id', 'score').orderBy('score', 'desc');
      const updates = rows.map((row, index) => {
        const rank = index + 1;
        return trx(this.table)
          .where({ user_id: row.user_id })
          .update({ rank, updated_at: db.raw('CURRENT_TIMESTAMP') });
      });
      await Promise.all(updates);
      await trx.commit();
    } catch (err) {
      await trx.rollback();
      console.error('Error recalculating all rankings:', err);
      throw err;
    }
  }
}

module.exports = new RankingService();