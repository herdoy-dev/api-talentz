class Response {
  success;
  message;
  data;
  count;
  currentPage;
  pageCount;

  constructor(success, message, data, count, page, pageSize) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.count = count;
    this.setCurrentPage(page);
    this.setPageCount(page, pageSize);
  }

  setCurrentPage(page) {
    this.page = parseInt(page);
  }

  setPageCount(count, pageSize) {
    this.pageCount = Math.ceil(count / parseInt(pageSize));
  }
}

export default Response;
