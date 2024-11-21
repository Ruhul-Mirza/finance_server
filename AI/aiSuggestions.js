
// AI Suggestion function
function generateAIRecommendation(expenses) {
    const { rentAmount, foodAmount, entertainmentAmount, utilitiesAmount, personalAmount, othersAmount, monthlyAmount } = expenses;
    
    const totalExpenses = rentAmount + foodAmount + entertainmentAmount + utilitiesAmount + personalAmount + othersAmount;
    const savings = monthlyAmount - totalExpenses;
  
    if (savings < 0) {
      return 'You are spending more than your income. Consider reducing your rent or food expenses.';
    } else if (savings >= 0 && savings < 0.1 * monthlyAmount) {
      return 'You are saving, but there is room to improve. Try reducing your entertainment or utilities expenses.';
    } else {
      return 'You are saving well. Consider investing your savings for long-term growth.';
    }
  }
  
  module.exports = generateAIRecommendation;
  