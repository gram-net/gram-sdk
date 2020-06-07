/** @format */

export const testfc = `() recv_internal(slice in_msg) impure { }
() recv_external(slice in_msg) impure {
  var data = begin_parse(get_data());
  var seqno = data~load_uint(32);
  var seqno_in = in_msg~load_uint(32);
  if(seqno == seqno_in) {
    accept_message();
    set_data(begin_cell().store_uint(seqno + 1,32).end_cell());
  }
}`
