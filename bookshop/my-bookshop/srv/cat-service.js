module.exports = (srv) => {
    const {Books} = cds.entities ('my-bookshop')
    // console.log(srv)
    srv.before('CREATE', 'Orders', async (req)=>{
        const order = req.data
        if(!order.amount || order.amount <= 0) return req.error(400, 'Order at Least 1 Book')
        const tx = cds.transaction(req)
        const affectedRows = await tx.run(
            UPDATE (Books)
                .set ({ stock: {'-=': order.amount }})
                .where ({ stock: {'>=': order.amount}, ID: order.book_ID})
        )
        if(affectedRows === 0) req.error(409, 'Sold Out, Sorry')
    })

    //discount on overstocked books
    srv.after('READ', 'Books', async (each) => {
        if(each.stock > 150) each.title += ' -- 10% Discount'
    })
}