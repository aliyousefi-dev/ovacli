package indexer

func (s *Indexer) PushVideo(videoPath string) error {

	s.queue = append(s.queue, videoPath)

	return nil
}

func (s *Indexer) ClearQueue() error {

	s.queue = []string{}

	return nil
}
