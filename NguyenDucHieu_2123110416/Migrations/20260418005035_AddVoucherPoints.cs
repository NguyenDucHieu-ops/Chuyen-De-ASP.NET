using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NguyenDucHieu_2123110416.Migrations
{
    /// <inheritdoc />
    public partial class AddVoucherPoints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Vouchers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "PointsRequired",
                table: "Vouchers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "Banners",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392));

            migrationBuilder.UpdateData(
                table: "Toppings",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392));

            migrationBuilder.UpdateData(
                table: "Toppings",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392));

            migrationBuilder.UpdateData(
                table: "Toppings",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392));

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "Description", "ExpiryDate", "PointsRequired" },
                values: new object[] { new DateTime(2026, 4, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392), "", new DateTime(2026, 5, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392), 0 });

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "Description", "ExpiryDate", "PointsRequired" },
                values: new object[] { new DateTime(2026, 4, 18, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392), "", new DateTime(2026, 5, 3, 7, 50, 32, 702, DateTimeKind.Local).AddTicks(392), 0 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Vouchers");

            migrationBuilder.DropColumn(
                name: "PointsRequired",
                table: "Vouchers");

            migrationBuilder.UpdateData(
                table: "Banners",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 17, 22, 23, 18, 976, DateTimeKind.Local).AddTicks(5032));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 17, 22, 23, 18, 976, DateTimeKind.Local).AddTicks(5032));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 17, 22, 23, 18, 976, DateTimeKind.Local).AddTicks(5032));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 17, 22, 23, 18, 976, DateTimeKind.Local).AddTicks(5032));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 17, 22, 23, 18, 976, DateTimeKind.Local).AddTicks(5032));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 17, 22, 23, 18, 976, DateTimeKind.Local).AddTicks(5032));

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 17, 22, 23, 18, 976, DateTimeKind.Local).AddTicks(5032));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 17, 22, 23, 18, 976, DateTimeKind.Local).AddTicks(5032));

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 17, 22, 23, 18, 976, DateTimeKind.Local).AddTicks(5032));

            migrationBuilder.UpdateData(
                table: "Toppings",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 17, 22, 23, 18, 976, DateTimeKind.Local).AddTicks(5032));

            migrationBuilder.UpdateData(
                table: "Toppings",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 17, 22, 23, 18, 976, DateTimeKind.Local).AddTicks(5032));

            migrationBuilder.UpdateData(
                table: "Toppings",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 17, 22, 23, 18, 976, DateTimeKind.Local).AddTicks(5032));

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "ExpiryDate" },
                values: new object[] { new DateTime(2026, 4, 17, 22, 23, 18, 976, DateTimeKind.Local).AddTicks(5032), new DateTime(2026, 5, 17, 22, 23, 18, 976, DateTimeKind.Local).AddTicks(5032) });

            migrationBuilder.UpdateData(
                table: "Vouchers",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "ExpiryDate" },
                values: new object[] { new DateTime(2026, 4, 17, 22, 23, 18, 976, DateTimeKind.Local).AddTicks(5032), new DateTime(2026, 5, 2, 22, 23, 18, 976, DateTimeKind.Local).AddTicks(5032) });
        }
    }
}
