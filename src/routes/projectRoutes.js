router.post('/projects/:id/volunteer', requireLogin, async (req, res) => {
    const projectId = req.params.id;
    const userId = req.session.user.id;
    
    await addVolunteer(userId, projectId);
    res.redirect(`/projects/${projectId}`);
});

router.post('/projects/:id/remove-volunteer', requireLogin, async (req, res) => {
    const projectId = req.params.id;
    const userId = req.session.user.id;
    
    await removeVolunteer(userId, projectId);
    res.redirect(`/projects/${projectId}`);
});