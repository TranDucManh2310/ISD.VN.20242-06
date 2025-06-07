import React, { Fragment, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MDBDataTable } from 'mdbreact'
import Swal from "sweetalert2"
import Title from "./Title"

import MetaData from '../layout/MetaData'
import Loader from '../layout/Loader'
import Sidebar from './Sidebar'

import { useAlert } from 'react-alert'
import { useDispatch, useSelector } from 'react-redux'
import { allOrders, deleteOrder, clearErrors } from '../../actions/orderActions'
import { DELETE_ORDER_RESET } from '../../constants/orderConstants'

const OrdersList = () => {
	const navigate = useNavigate();
	const alert = useAlert();
	const dispatch = useDispatch();
	const isMountedRef = useRef(true);

	const { loading, error, orders } = useSelector(state => state.allOrders);
	const { isDeleted, error: deleteError } = useSelector(state => state.order);

	useEffect(() => {
		isMountedRef.current = true;
		dispatch(allOrders());

		return () => {
			isMountedRef.current = false;
		};
	}, [dispatch]);

	useEffect(() => {
		if (error && isMountedRef.current) {
			alert.error(error);
			dispatch(clearErrors());
		}

		if (deleteError && isMountedRef.current) {
			alert.error(deleteError);
			dispatch(clearErrors());
		}

		if (isDeleted && isMountedRef.current) {
			// Không cần navigate vì đã ở trang orders
			// alert.success('Order deleted successfully'); // Sẽ dùng Swal thay thế
			
			// Reset delete state
			dispatch({ type: DELETE_ORDER_RESET });
			
			// Reload orders list
			dispatch(allOrders());
		}

	}, [dispatch, alert, error, deleteError, isDeleted]);

	const deleteOrderHandler = (id) => {
		if (!isMountedRef.current) return;

		Swal.fire({
			title: "Bạn có muốn xóa đơn hàng này?",
			text: "Bạn không thể hoàn tác lại hành động này!",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#3085d6",
			cancelButtonColor: "#d33",
			confirmButtonText: "Có, xóa đơn hàng!",
			cancelButtonText: "Hủy"
		}).then((result) => {
			if (result.isConfirmed && isMountedRef.current) {
				try {
					console.log("Deleting order with ID:", id);
					dispatch(deleteOrder(id));
					
					Swal.fire({
						title: "Đã xóa!",
						text: "Đơn hàng đã được xóa thành công.",
						icon: "success",
						timer: 2000,
						showConfirmButton: false
					});
				} catch (error) {
					console.error("Error deleting order:", error);
					if (isMountedRef.current) {
						Swal.fire({
							title: "Lỗi!",
							text: "Có lỗi xảy ra khi xóa đơn hàng.",
							icon: "error"
						});
					}
				}
			}
		}).catch((error) => {
			console.error("Swal error:", error);
		});
	};

	const setOrders = () => {
		const data = {
			columns: [
				{
					label: 'ID',
					field: 'id',
					sort: 'asc'
				},
				{
					label: 'Số lượng',
					field: 'numofItems',
					sort: 'asc'
				},
				{
					label: 'Tổng tiền',
					field: 'amount',
					sort: 'asc'
				},
				{
					label: 'Trạng thái',
					field: 'status',
					sort: 'asc'
				},
				{
					label: 'Ngày đặt',
					field: 'date',
					sort: 'asc'
				},
				{
					label: 'Thao tác',
					field: 'actions',
				},
			],
			rows: []
		}

		// Kiểm tra orders có tồn tại và là array
		if (orders && Array.isArray(orders)) {
			orders.forEach(order => {
				data.rows.push({
					id: order._id,
					numofItems: order.orderItems?.length || 0,
					amount: `$${order.totalPrice}`,
					status: order.orderStatus && String(order.orderStatus).includes('Delivered')
						? <p style={{ color: 'green' }}>{order.orderStatus}</p>
						: <p style={{ color: 'red' }}>{order.orderStatus}</p>,
					date: order.createdAt ? String(order.createdAt).substring(0, 10) : 'N/A',
					actions: <Fragment>
						<Link to={`/admin/order/${order._id}`} className="btn btn-primary py-1 px-2">
							<i className="fa fa-eye"></i>
						</Link>
						<button 
							className="btn btn-danger py-1 px-2 ml-2" 
							onClick={() => deleteOrderHandler(order._id)}
							disabled={loading}
						>
							<i className="fa fa-trash"></i>
						</button>
					</Fragment>
				});
			});
		}

		return data;
	}

	return (
		<Fragment>
			<MetaData title={'All Orders'} />
			<div className="row mt-5">
				<div className="col-12 col-md-2 mt-3">
					<Sidebar />
				</div>

				<div className="col-12 col-md-10 mt-5">
					<Fragment>
						
						<Title> Tất cả đơn hàng </Title>
						{loading ? <Loader /> : (
							<MDBDataTable
								data={setOrders()}
								className="px-3"
								bordered
								striped
								hover
							/>
						)}

					</Fragment>
				</div>
			</div>

		</Fragment>
	)
}

export default OrdersList
