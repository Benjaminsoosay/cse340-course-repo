// src/controllers/homeController.js
export function showHomePage(req, res) {
    res.render('home', { 
        title: 'Home', 
        user: req.session.user || null 
    });
}