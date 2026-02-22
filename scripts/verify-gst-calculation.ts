
import { calculateGstAmounts } from '../lib/utils/invoice';

function runTests() {
    console.log('Running GST Calculation Tests (Shared Utility)...\n');

    // Test Case 1: GST Exclusive (Default)
    console.log('Test Case 1: GST Exclusive (1000 + 18%)');
    const exclusiveResult = calculateGstAmounts({
        amountEntered: 1000,
        gstRate: 18,
        isGstInclusive: false,
    });
    console.log('Expected: Base=1000, GST=180, Total=1180');
    console.log('Actual:  ', exclusiveResult);
    console.assert(exclusiveResult.baseAmount === 1000, 'Base amount mismatch');
    console.assert(exclusiveResult.gstAmount === 180, 'GST amount mismatch');
    console.assert(exclusiveResult.totalAmount === 1180, 'Total mismatch');
    console.log(exclusiveResult.totalAmount === 1180 ? '✅ PASS' : '❌ FAIL');
    console.log('\n');

    // Test Case 2: GST Inclusive
    console.log('Test Case 2: GST Inclusive (1180 incl. 18%)');
    const inclusiveResult = calculateGstAmounts({
        amountEntered: 1180,
        gstRate: 18,
        isGstInclusive: true,
    });
    console.log('Expected: Base=1000, GST=180, Total=1180');
    console.log('Actual:  ', inclusiveResult);
    console.assert(Math.abs(inclusiveResult.baseAmount - 1000) < 0.01, 'Base amount mismatch');
    console.assert(Math.abs(inclusiveResult.gstAmount - 180) < 0.01, 'GST amount mismatch');
    console.assert(inclusiveResult.totalAmount === 1180, 'Total mismatch');
    console.log(Math.abs(inclusiveResult.baseAmount - 1000) < 0.01 ? '✅ PASS' : '❌ FAIL');
    console.log('\n');

    // Test Case 3: No GST
    console.log('Test Case 3: No GST (1000)');
    const noGstResult = calculateGstAmounts({
        amountEntered: 1000,
        gstRate: null,
        isGstInclusive: false,
    });
    console.log('Expected: Base=1000, GST=0, Total=1000');
    console.log('Actual:  ', noGstResult);
    console.assert(noGstResult.baseAmount === 1000, 'Base amount mismatch');
    console.assert(noGstResult.gstAmount === 0, 'GST amount mismatch');
    console.assert(noGstResult.totalAmount === 1000, 'Total mismatch');
    console.log(noGstResult.totalAmount === 1000 ? '✅ PASS' : '❌ FAIL');
}

runTests();
