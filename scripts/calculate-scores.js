// スコア計算を実行するスクリプト
async function calculateScores() {
    try {
        const response = await fetch('http://localhost:3000/api/calculate-life-balance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (response.ok) {
            const data = await response.json()
            console.log('✅ Life Balance scores calculated successfully!')
            console.log('\nScores:')
            console.log(JSON.stringify(data.scores, null, 2))
        } else {
            const error = await response.json()
            console.error('❌ Failed to calculate scores:', error)
        }
    } catch (error) {
        console.error('❌ Error:', error)
    }
}

calculateScores()
