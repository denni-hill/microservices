interface CreateController<T> {
  create(data: Partial<T>): Promise<T>;
}

export default CreateController;
