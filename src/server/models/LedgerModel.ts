import { BaseModel } from './BaseModel';
import { LedgerTransaction, LedgerPosting } from '../../types';

export class LedgerModel extends BaseModel {
  async getAllTransactions(): Promise<LedgerTransaction[]> {
    const txRes = await this.db
      .prepare('SELECT * FROM ledger_transactions ORDER BY timestamp DESC')
      .all<LedgerTransaction>();
    
    const transactions = txRes.results || [];
    for (const tx of transactions) {
      const postRes = await this.db
        .prepare('SELECT * FROM ledger_postings WHERE transaction_id = ?')
        .bind(tx.id)
        .all<LedgerPosting>();
      tx.postings = postRes.results || [];
    }
    return transactions;
  }

  async getAllPostings(): Promise<LedgerPosting[]> {
    const res = await this.db
      .prepare('SELECT * FROM ledger_postings ORDER BY id ASC')
      .all<LedgerPosting>();
    return res.results || [];
  }

  async getAccountBalances(): Promise<Record<string, { debit: number; credit: number; net: number }>> {
    const postings = await this.getAllPostings();
    const balances: Record<string, { debit: number; credit: number; net: number }> = {};

    for (const post of postings) {
      if (!balances[post.account]) {
        balances[post.account] = { debit: 0, credit: 0, net: 0 };
      }
      if (post.posting_type === 'DEBIT') {
        balances[post.account].debit += post.amount_php;
      } else {
        balances[post.account].credit += post.amount_php;
      }
      balances[post.account].net = balances[post.account].debit - balances[post.account].credit;
    }
    return balances;
  }

  async insertTransaction(tx: LedgerTransaction, postings: LedgerPosting[]): Promise<boolean> {
    const txRes = await this.db
      .prepare(`
        INSERT INTO ledger_transactions (
          id, transaction_ref, reference_type, reference_id,
          idempotency_key, description, previous_hash, block_hash
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        tx.id,
        tx.transaction_ref,
        tx.reference_type,
        tx.reference_id,
        tx.idempotency_key,
        tx.description,
        tx.previous_hash,
        tx.block_hash
      )
      .run();

    if (!txRes.success) return false;

    for (const post of postings) {
      await this.db
        .prepare(`
          INSERT INTO ledger_postings (
            id, transaction_id, account, posting_type, amount_php
          ) VALUES (?, ?, ?, ?, ?)
        `)
        .bind(
          post.id,
          tx.id,
          post.account,
          post.posting_type,
          post.amount_php
        )
        .run();
    }
    return true;
  }
}
