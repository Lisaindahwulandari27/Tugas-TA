
export interface Transaction {
  id: string;
  items: string[];
}

export interface FrequentItemset {
  items: string[];
  support: number;
  count: number;
}

export interface AssociationRule {
  antecedent: string[];
  consequent: string[];
  confidence: number;
  lift: number;
  support: number;
}

export class AprioriAnalysis {
  private transactions: Transaction[];
  private minSupport: number;
  private minConfidence: number;

  constructor(transactions: Transaction[], minSupport: number = 0.3, minConfidence: number = 0.6) {
    this.transactions = transactions;
    this.minSupport = minSupport;
    this.minConfidence = minConfidence;
  }

  // Mendapatkan frequent itemsets
  getFrequentItemsets(): FrequentItemset[] {
    const allItems = this.getAllUniqueItems();
    let frequentItemsets: FrequentItemset[] = [];
    
    // L1: Frequent 1-itemsets
    const oneItemsets = this.generateOneItemsets(allItems);
    frequentItemsets.push(...oneItemsets);

    // L2 dan seterusnya
    let currentItemsets = oneItemsets;
    let k = 2;

    while (currentItemsets.length > 0 && k <= 3) { // Batasi sampai 3-itemsets untuk performa
      const candidates = this.generateCandidates(currentItemsets, k);
      const frequent = this.filterFrequentItemsets(candidates);
      
      if (frequent.length > 0) {
        frequentItemsets.push(...frequent);
        currentItemsets = frequent;
      } else {
        break;
      }
      k++;
    }

    return frequentItemsets.sort((a, b) => b.support - a.support);
  }

  // Mendapatkan association rules
  getAssociationRules(): AssociationRule[] {
    const frequentItemsets = this.getFrequentItemsets().filter(itemset => itemset.items.length >= 2);
    const rules: AssociationRule[] = [];

    frequentItemsets.forEach(itemset => {
      if (itemset.items.length >= 2) {
        const subsets = this.generateSubsets(itemset.items);
        
        subsets.forEach(subset => {
          if (subset.length > 0 && subset.length < itemset.items.length) {
            const consequent = itemset.items.filter(item => !subset.includes(item));
            
            const antecedentSupport = this.calculateSupport(subset);
            const confidence = itemset.support / antecedentSupport;
            const consequentSupport = this.calculateSupport(consequent);
            const lift = confidence / consequentSupport;

            if (confidence >= this.minConfidence) {
              rules.push({
                antecedent: subset,
                consequent,
                confidence,
                lift,
                support: itemset.support
              });
            }
          }
        });
      }
    });

    return rules.sort((a, b) => b.confidence - a.confidence);
  }

  private getAllUniqueItems(): string[] {
    const items = new Set<string>();
    this.transactions.forEach(transaction => {
      transaction.items.forEach(item => items.add(item));
    });
    return Array.from(items);
  }

  private generateOneItemsets(items: string[]): FrequentItemset[] {
    const itemsets: FrequentItemset[] = [];
    
    items.forEach(item => {
      const support = this.calculateSupport([item]);
      const count = Math.round(support * this.transactions.length);
      
      if (support >= this.minSupport) {
        itemsets.push({
          items: [item],
          support,
          count
        });
      }
    });

    return itemsets;
  }

  private generateCandidates(frequentItemsets: FrequentItemset[], k: number): string[][] {
    const candidates: string[][] = [];
    
    for (let i = 0; i < frequentItemsets.length; i++) {
      for (let j = i + 1; j < frequentItemsets.length; j++) {
        const itemset1 = frequentItemsets[i].items.sort();
        const itemset2 = frequentItemsets[j].items.sort();
        
        // Gabungkan jika k-2 item pertama sama
        let canJoin = true;
        for (let l = 0; l < k - 2; l++) {
          if (itemset1[l] !== itemset2[l]) {
            canJoin = false;
            break;
          }
        }
        
        if (canJoin) {
          const candidate = [...new Set([...itemset1, ...itemset2])].sort();
          if (candidate.length === k) {
            candidates.push(candidate);
          }
        }
      }
    }

    return candidates;
  }

  private filterFrequentItemsets(candidates: string[][]): FrequentItemset[] {
    const frequent: FrequentItemset[] = [];
    
    candidates.forEach(candidate => {
      const support = this.calculateSupport(candidate);
      const count = Math.round(support * this.transactions.length);
      
      if (support >= this.minSupport) {
        frequent.push({
          items: candidate,
          support,
          count
        });
      }
    });

    return frequent;
  }

  private calculateSupport(items: string[]): number {
    const count = this.transactions.filter(transaction => 
      items.every(item => transaction.items.includes(item))
    ).length;
    
    return count / this.transactions.length;
  }

  private generateSubsets(items: string[]): string[][] {
    const subsets: string[][] = [];
    const n = items.length;
    
    for (let i = 1; i < Math.pow(2, n) - 1; i++) {
      const subset: string[] = [];
      for (let j = 0; j < n; j++) {
        if (i & (1 << j)) {
          subset.push(items[j]);
        }
      }
      subsets.push(subset);
    }
    
    return subsets;
  }
}
