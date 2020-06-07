/** @format */

export const test1fc = `() ticktock(int ttop) {
  if(ttop) {

  }
}

() recv_internal(int msg_value, cell in_msg_cell, slice in_msg) impure {
  
  throw_unless(35, msg_value == 1073741824); ;; price = 2^30 nanogram = 1.073741824 GRAM
  
  var cs2 = begin_parse(get_data());
  var stored_seqno = cs2~load_uint(32);
  var public_key = cs2~load_uint(256);
  var users = cs2~load_dict();
  var pending = cs2~load_dict();

  var sponsor_pk = in_msg~load_uint(256);
  var pk = in_msg~load_uint(256);
  var msg_addr = in_msg~load_bits(264);
  var size_tid = in_msg~load_uint(6);
  var tid = in_msg~load_ref();
  throw_unless(36,
    tid.begin_parse().slice_bits() == size_tid * 8
  );
  pending~udict_set_builder(256, pk, 
    begin_cell()
      .store_uint(sponsor_pk, 256)
      .store_slice(msg_addr)
      .store_ref(tid));
  set_data(begin_cell().store_uint(stored_seqno, 32).store_uint(public_key, 256).store_dict(pending).store_dict(users).end_cell());
}

() recv_external(slice in_msg) impure {
  var signature = in_msg~load_bits(512);
  var cs = in_msg;
  int msg_seqno = cs~load_uint(32);
  var cs2 = begin_parse(get_data());
  var stored_seqno = cs2~load_uint(32);
  var public_key = cs2~load_uint(256);
  var pending = cs2~load_dict();
  var users = cs2~load_dict();
  cs2.end_parse();
  throw_unless(33, msg_seqno == stored_seqno);
  throw_unless(34, check_signature(slice_hash(in_msg), signature, public_key));
  accept_message();
  ;; cs~touch();
  var op = cs~load_uint(2);
  if (op == 0) { ;; register
    var pk = cs~load_uint(256);
    users~udict_set(256, pk, cs);
  } elseif (op == 1) { ;; invalidate
    var pk = cs~load_uint(256);
    pending~udict_delete?(256, pk);
  } elseif (op == 2) { ;; validate
    var pk = cs~load_uint(256);
    var (p, _) = pending.udict_get?(256, pk);
    var spk = p~load_uint(256);
    users~udict_set_builder(256, pk, begin_cell().store_slice(p~load_bits(264)).store_uint(0, 32).store_dict(null()));
    var (sponsor, _) = users.udict_get?(256, spk);

    
  } else { ;; ticktock
    ticktock(0);
  }

  set_data(begin_cell().store_uint(stored_seqno + 1, 32).store_uint(public_key, 256).store_dict(pending).store_dict(users).end_cell());
}`
