var gui = (function () {

	'use strict';

	var publicGui = {};

    publicGui.onLoad = function () {
        gui.showStatus("");
        gui.showInfo("");
        gui.showPageMain();
        showMeritprice();
    }; 

    function showStatusTopBottom () {
        $("#statusTop").show();
        //$("#statusBottom").show();
    };

    function hideStatusTopBottom () {
        $("#statusTop").hide();
        //$("#statusBottom").hide();
    };

    publicGui.showPageMain = function () {
        hideStatusTopBottom();
        $('#featPageOwner').hide();
        $('#featPageStat').hide();
        $('#featPageToken').hide();
        $('#featPageTicket').hide();
        $('#featPageDefi').hide();
        $('#featPage1').hide();
        $('#mainHeader').show();
        $('#mainFooter').show();
        $('#menuMain').addClass("w3-white");
        $('#menuFeat').removeClass("w3-white"); $('#menuFeat1').removeClass("w3-white");
        $('#menuDefiApp').removeClass("w3-white"); $('#menuDefiApp1').removeClass("w3-white");
        $('#menuIdApp').removeClass("w3-white"); $('#menuIdApp1').removeClass("w3-white");
        $('#menuIdOwner').removeClass("w3-white"); $('#menuIdOwner1').removeClass("w3-white");
        gui.showStatus("");
        gui.showInfo("");
    };  

    publicGui.showPageFeat = function () {
        showStatusTopBottom();
        $('#mainHeader').hide();
        $('#mainFooter').hide();
        $('#featPageOwner').hide();
        $('#featPageStat').hide();
        $('#featPageToken').show();
        $('#featPageTicket').hide();
        $('#featPageDefi').hide();
        $('#featPage1').show();
        $('#menuMain').removeClass("w3-white");
        $('#menuFeat').addClass("w3-white"); $('#menuFeat1').addClass("w3-white");
        $('#menuDefiApp').removeClass("w3-white"); $('#menuDefiApp1').removeClass("w3-white");
        $('#menuIdApp').removeClass("w3-white"); $('#menuIdApp1').removeClass("w3-white");
        $('#menuIdOwner').removeClass("w3-white"); $('#menuIdOwner1').removeClass("w3-white");
        gui.showStatus("");
        gui.showInfo("");
    };  

    publicGui.showPageDefi = function () {
        showStatusTopBottom();
        $('#mainHeader').hide();
        $('#mainFooter').hide();
        $('#featPageOwner').hide();
        $('#featPageStat').hide();
        $('#featPageToken').show();
        $('#featPageTicket').hide();
        $('#featPageDefi').show();
        $('#featPage1').hide();
        $('#menuMain').removeClass("w3-white");
        $('#menuFeat').removeClass("w3-white"); $('#menuFeat1').removeClass("w3-white");
        $('#menuDefiApp').addClass("w3-white"); $('#menuDefiApp1').addClass("w3-white");
        $('#menuIdApp').removeClass("w3-white"); $('#menuIdApp1').removeClass("w3-white");
        $('#menuIdOwner').removeClass("w3-white"); $('#menuIdOwner1').removeClass("w3-white");
        gui.showStatus("");
        gui.showInfo("");
    };  

    publicGui.showPageId = function () {
        showStatusTopBottom();
        $('#mainHeader').hide();
        $('#mainFooter').hide();
        $('#featPageOwner').hide();
        $('#featPageStat').hide();
        $('#featPageToken').show();
        $('#featPageTicket').show();
        $('#featPageDefi').hide();
        $('#featPage1').hide();
        $('#menuMain').removeClass("w3-white");
        $('#menuFeat').removeClass("w3-white"); $('#menuFeat1').removeClass("w3-white");
        $('#menuDefiApp').removeClass("w3-white"); $('#menuDefiApp1').removeClass("w3-white");
        $('#menuIdApp').addClass("w3-white"); $('#menuIdApp1').addClass("w3-white");
        $('#menuIdOwner').removeClass("w3-white"); $('#menuIdOwner1').removeClass("w3-white");
        gui.showStatus("");
        gui.showInfo("");
    };  

    publicGui.showPageOwner = function () {
        showStatusTopBottom();
        $('#mainHeader').hide();
        $('#mainFooter').hide();
        $('#featPageOwner').show();
        $('#featPageStat').hide();
        $('#featPageToken').show();
        $('#featPage1').hide();
        $('#menuMain').removeClass("w3-white");
        $('#menuFeat').removeClass("w3-white"); $('#menuFeat1').removeClass("w3-white");
        $('#menuDefiApp').removeClass("w3-white"); $('#menuDefiApp1').removeClass("w3-white");
        $('#menuIdApp').removeClass("w3-white"); $('#menuIdApp1').removeClass("w3-white");
        $('#menuIdOwner').addClass("w3-white"); $('#menuIdOwner1').addClass("w3-white");
        gui.showStatus("");
        gui.showInfo("");
    };  

    publicGui.handlePageTicket = function (ncmerit) {
        if (ncmerit > 0) {
            $('#txtTicketDemo').hide();
            $("#txtEligible").text("You are eligible to login, congratulations!");
            $('#btnTicketLogin').prop('disabled', false);
        }
        else {
            $('#txtTicketDemo').show();
            $("#txtEligible").text("You are not eligible to login");
            $('#btnTicketLogin').prop('disabled', true);
        }
    };

    publicGui.handlePageDefi = function (ncmerit) {
        if (ncmerit > 0) {
            $('#txtDefiDemo').hide();
            $("#txtDefi").text("Use your SEM to borrow!");
            $('#btnDefiBorrow').prop('disabled', false);
        }
        else {
            $('#txtDefiDemo').show();
            $("#txtDefi").text("You need to use your SEM for collateral");
            $('#btnDefiBorrow').prop('disabled', true);
        }
    };

    publicGui.showMeritStat = function () {
        $('#featPageStat').show();
    };

    publicGui.hideMeritStat = function () {
        $('#featPageStat').hide();
    };

    publicGui.showMeritIdPrevNext = function () {
        $('#moIdPrev').show();
        $('#moIdNext').show();
    };

    publicGui.hideMeritIdPrevNext = function () {
        $('#moIdPrev').hide();
        $('#moIdNext').hide();
    };

    publicGui.showError = function (msg) {
        gui.showInfo(msg);
    };  
    publicGui.showLog = function (msg) {
        console.log(msg);
    };    
    publicGui.showInfo = function (msg) {
        $("#txGameStatus").text(msg);
    };   
    publicGui.showStatus = function (msg) {
        $("#txStatus").text(msg);
    };  
    publicGui.showAlert = function (msg) {
        alert(msg);
    }; 

    function showMeritprice () {
        $("#merPrice").text("1 SEM = 100 EVMOS");
    };   

    publicGui.showPlayer = function (str) {
        $("#gmPlayer").text(str);
        $("#gmPlayer1").text(str);
    };

    publicGui.showHideConnect = function (isshow) {
        if (isshow) {
            $('#btnConnect').show().prop('disabled', false);
            $('#btnConnect1').show().prop('disabled', false);
        } else {
            $('#btnConnect').hide().prop('disabled', true);
            $('#btnConnect1').hide().prop('disabled', true);
        }
    };

    publicGui.showActionTime = function (ts) {
        let unix_timestamp = ts
        var d = new Date(unix_timestamp * 1000);
        let str = d.toLocaleDateString() + "  " + d.toLocaleTimeString();

        $("#moTime").text(str);
    };


	return publicGui;

})();