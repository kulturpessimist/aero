watch('db/.*') {
	system('kanso push local')
}

watch('frontend/.*') {
	system('kanso push local')
}
