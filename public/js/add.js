var userJson = [];
var sapphireJson = [];
var currPage = 1;

// Initialize week dropdown for activity modal
function loadWeekDropdown() {
  var weeks = "";
  for (let i = 1; i <= 53; i++) {
    weeks += `<option value="${i}">Week ${i}</option>`;
  }
  $("#activityWeek").append(weeks);
}

// Load week dropdown on page load
$(document).ready(function() {
  loadWeekDropdown();
});

$("#saveMember").on("click", function () {
  addPerson();
});

$("#saveActivity").on("click", function () {
  saveActivity();
});

function reloadData(){
  $("#pagination").addClass("hidden");
  $(".names").html("");
  if($("#groupSelect").val()=="SKB"){
    loadNames();
  }else{
    loadSapphire();
  }
}

//==========================================
// LOADER
//==========================================

function showLoader(customMsg = "") {
  $("#loader_main").removeClass("hidden");
  if (customMsg == "") {
    loader_main_content.innerHTML = "Loading.. please wait !";
  } else {
    loader_main_content.innerHTML = customMsg;
  }
}

function hideLoader() {
  $("#loader_main").addClass("hidden");
}

//==========================================
// LOADER ENDS
//==========================================

function addPerson() {
  const memberData = {
    node: $("#memberNode").val(),
    group: $("#memberGroup").val(),
    irId: $("#memberIRID").val(),
    name: $("#memberName").val(),
    phone: $("#memberPhone").val(),
    email: $("#memberEmail").val(),
    targets: {
      networking: $("#memberNetworkingTarget").val() || 0,
      infos: $("#memberInfosTarget").val() || 0,
      invis: $("#memberInvisTarget").val() || 0,
      plans: $("#memberPlansTarget").val() || 0,
      meetups: $("#memberMeetupsTarget").val() || 0,
      socialMedia: $("#memberSocialMediaTarget").val() || 0
    }
  };

  // Validate required fields
  if (!memberData.node || !memberData.group || !memberData.name) {
    alert("Please fill in all required fields (Node, Group, and Name)");
    return;
  }

  $.ajax({
    url: "/add/saveMember",
    type: "POST",
    dataType: "json",
    data: memberData,
    success: function (response) {
      if (response.success) {
        alert("Member added successfully!");
        $("#addPersonModal").removeClass("modal-open");
        reloadData();
        // Clear form
        $("#memberNode, #memberGroup, #memberIRID, #memberName, #memberPhone, #memberEmail").val("");
        $("#memberNetworkingTarget, #memberInfosTarget, #memberInvisTarget, #memberPlansTarget, #memberMeetupsTarget, #memberSocialMediaTarget").val("");
      } else {
        alert("Error: " + response.message);
      }
    },
    error: function (xhr, status, error) {
      alert("Error adding member: " + error);
    }
  });
}

function saveActivity() {
  const activityData = {
    memberId: $("#activityMemberId").val(),
    week: $("#activityWeek").val(),
    year: $("#activityYear").val(),
    activities: {
      networking: $("#activityNetworking").val() || 0,
      infos: $("#activityInfos").val() || 0,
      invis: $("#activityInvis").val() || 0,
      plans: $("#activityPlans").val() || 0,
      meetups: $("#activityMeetups").val() || 0,
      socialMedia: $("#activitySocialMedia").val() || 0
    }
  };

  if (!activityData.week || !activityData.year) {
    alert("Please select week and year");
    return;
  }

  $.ajax({
    url: "/add/saveActivity",
    type: "POST",
    dataType: "json",
    data: activityData,
    success: function (response) {
      if (response.success) {
        alert("Activity updated successfully!");
        $("#activityUpdateModal").removeClass("modal-open");
      } else {
        alert("Error: " + response.message);
      }
    },
    error: function (xhr, status, error) {
      alert("Error updating activity: " + error);
    }
  });
}

function openActivityModal(memberId, memberName, targets) {
  $("#activityMemberId").val(memberId);
  $("#activityMemberName").text(memberName);
  
  // Set target values
  $("#networkingTarget").text(targets.networking || 0);
  $("#infosTarget").text(targets.infos || 0);
  $("#invisTarget").text(targets.invis || 0);
  $("#plansTarget").text(targets.plans || 0);
  $("#meetupsTarget").text(targets.meetups || 0);
  $("#socialMediaTarget").text(targets.socialMedia || 0);
  
  $("#activityUpdateModal").addClass("modal-open");
}

function addMemberModal() {
  $("#addPersonModal").addClass("modal-open");
}

function addName(name) {
  if ($("#memberGroup").val() == "SKB") {
    $("#groupSelect").val("SKB").change();
  } else {
    $("#groupSelect").val("Sapphire").change();
  }
}

function changeGroup() {
  const grp = $("#groupSelect").val();
  $("#pagination").addClass("hidden");
  $(".names").html("");
  if (grp == "SKB") {
    loadNames();
  } else {
    loadSapphire();
  }
}

function parseLastLogin(lastLoginStr) {
  var parsedStr = "";

  if (lastLoginStr != "") {
    const arr = lastLoginStr.split(" ");
    for (let i = 0; i < 4; i++) {
      parsedStr += arr[i];
      if (i != 3) {
        parsedStr += " ";
      }
    }
  }

  return parsedStr;
}

function generateNamesTable(response, group = "SKB") {
  $(".names").html("");
  $("#pageNumber").html(currPage);

  var endindex = 0;
  var startindex = (currPage - 1) * 5;

  if (response.length > currPage * 5) {
    endindex = currPage * 5;
  } else {
    endindex = response.length;
  }

  for (let i = startindex; i < endindex; i++) {
    const member = response[i];
    $(".names").append(`
      <tr>
        <th>${i + 1}</th>
        <td>
          <div class="flex items-center gap-3">
            <div class="avatar">
              <div class="mask mask-squircle w-12 h-12">
                <img src="/images/avatars/default.png" alt="Avatar" />
              </div>
            </div>
            <div>
              <div class="font-bold">${member.name || 'N/A'}</div>
            </div>
          </div>
        </td>
        <td>${member.irId || 'N/A'}</td>
        <td>${member.phone || 'N/A'}</td>
        <td>${member.email || 'N/A'}</td>
        <td class="text-center">
          <span class="badge badge-primary">${member.node || 'N/A'}</span>
        </td>
        <td class="text-center">
          <span class="badge badge-secondary">${member.group || 'N/A'}</span>
        </td>
        <td class="text-center">
          <button class="btn btn-sm btn-info" onclick="openActivityModal('${member.id}', '${member.name}', ${JSON.stringify(member.targets || {})})">
            <i class="size-4" data-lucide="activity"></i>
            Activities
          </button>
        </td>
        <td class="text-center">
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-sm btn-ghost">
              <i class="size-4" data-lucide="more-horizontal"></i>
            </div>
            <ul tabindex="0" class="dropdown-content menu z-[1] shadow bg-base-100 rounded-box w-52">
              <li><a onclick="editMember('${member.id}')">Edit</a></li>
              <li><a onclick="deleteMember('${member.id}', '${member.name}')" class="text-error">Delete</a></li>
            </ul>
          </div>
        </td>
      </tr>
    `);
  }

  $("#fromProspect").html(startindex + 1);
  $("#toProspect").html(endindex);
  $("#nlCount").html(response.length);
  $("#pagination").removeClass("hidden");
}

function copyToClipboard(elem, text) {
  navigator.clipboard.writeText(text);
  $(elem).addClass("hidden");
  $(elem).siblings(".badge").removeClass("hidden");
  setTimeout(function () {
    $(elem).siblings(".badge").addClass("hidden");
    $(elem).removeClass("hidden");
  }, 2000);
}

function deleteUserModal(name, group) {
  deleteMemberName.innerHTML = name;
  deleteMemberGroup.innerHTML = group;
  deletePersonModal.showModal();
}

function editUserModal(name, thunderbolID) {
  $("#updateUserBtn").attr("disabled", true);
  editUserName.value = name;
  editUserID.value = thunderbolID;
  editPersonModal.showModal();
}

function addMemberModal() {
  $("#saveMember").attr("disabled", true);
  $("#memberName").val("");
  $("#memberName")
    .parent()
    .removeClass("input-error")
    .removeClass("input-success");
  addPersonModal.showModal();
}

function thunderboltModal(thunderbolID, name) {
  namelistTable.innerHTML = "";
  namelistModalTitle.innerHTML = name;
  $("#paginationNL").addClass("hidden");
  resetFilter();
  getNLData(thunderbolID);
  thunderboltNLModal.showModal();
}

function checkIsValid(elem) {
  const id = $(elem).val();
  $(elem).attr("disabled", true);
  $("#loader_isValidID").removeClass("hidden");
  checkIsValidFB(id);
}

function checkValidName(elem) {
  const name = $("#memberName").val();
  const group = $("#memberGroup").val();
  $("#memberName").attr("disabled", true);
  $("#memberGroup").attr("disabled", true);
  $("#loader_isValidName").removeClass("hidden");
  checkValidNameFB(name, group);
}

//==============================
// Pagination

function setNLCount(count) {
  if (count > 0) {
    $("#pagination").removeClass("hidden");
  } else {
    $("#pagination").addClass("hidden");
  }
  nlCount.innerHTML = count;
  fromProspect.innerHTML = (currPage - 1) * 5 + 1;
  if (count > currPage * 5) {
    toProspect.innerHTML = currPage * 5;
  } else {
    toProspect.innerHTML = count;
  }
}

function goBack() {
  if (currPage > 1) {
    currPage = currPage - 1;
    pageNumber.innerHTML = currPage;
    if ($("#groupSelect").val() == "SKB") {
      generateNamesTable(userJson);
    } else {
      generateNamesTable(sapphireJson, "Sapphire");
    }
  }
}

function goForward() {
  if ($("#groupSelect").val() == "SKB") {
    if (currPage < userJson.length / 5) {
      currPage = currPage + 1;
      pageNumber.innerHTML = currPage;
      generateNamesTable(userJson);
    }
  } else {
    if (currPage < sapphireJson.length / 5) {
      currPage = currPage + 1;
      pageNumber.innerHTML = currPage;
      generateNamesTable(sapphireJson, "Sapphire");
    }
  }
}

//==============================
// AjAX methods

function checkIsValidFB(id) {
  const data = { id: id };
  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/add/isValidID");
  xhttp.onload = function () {
    const response = JSON.parse(this.responseText);

    if (response.avatarId == 0) {
      $("#updateUserBtn").attr("disabled", true);
      $("#alertInvalidThunderboltID").removeClass("hidden");
      setTimeout(function () {
        $("#alertInvalidThunderboltID").addClass("hidden");
      }, 6000);
    } else {
      $("#updateUserBtn").attr("disabled", false);
      thndrName.innerHTML = response.displayName;
      thndrEmail.innerHTML = response.email;
      $("#alertValidThunderboltID").removeClass("hidden");
      setTimeout(function () {
        $("#alertValidThunderboltID").addClass("hidden");
      }, 6000);
    }

    $("#editUserID").attr("disabled", false);
    $("#loader_isValidID").addClass("hidden");
  };
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(JSON.stringify(data));
}

function checkValidNameFB(name, group) {
  const data = { name: name, group: group };
  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/add/isValidName");
  xhttp.onload = function () {
    const response = this.responseText;
    console.log(response);

    if (response == "true") {
      //valid
      status_isValidName.innerHTML =
        '<i class="text-success" data-lucide="circle-check"></i>';
      $("#memberName")
        .parent()
        .removeClass("input-error")
        .addClass("input-success");
      $("#saveMember").attr("disabled", false);
    } else {
      //invalid
      status_isValidName.innerHTML =
        '<i class="text-error" data-lucide="circle-alert"></i>';
      $("#memberName")
        .parent()
        .removeClass("input-success")
        .addClass("input-error");
      $("#saveMember").attr("disabled", true);
    }
    loadIcons();

    $("#memberName").attr("disabled", false);
    $("#memberGroup").attr("disabled", false);
    $("#loader_isValidName").addClass("hidden");
  };
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(JSON.stringify(data));
}

function loadNames() {
  $("#reloadBtn").addClass("hidden");
  showLoader();
  currPage = 1;
  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/add/getNames");
  xhttp.onload = function () {
    const response = JSON.parse(this.responseText);
    userJson = response;
    setTeamDataSession(userJson);
    if (userJson.length > 0) {
      generateNamesTable(response);
    }
    hideLoader();
    $("#reloadBtn").removeClass("hidden");
  };
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send();
}

function loadSapphire() {
  $("#reloadBtn").addClass("hidden");
  showLoader();
  currPage = 1;
  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/add/getNamesSapphire");
  xhttp.onload = function () {
    const response = JSON.parse(this.responseText);
    sapphireJson = response;
    if (sapphireJson.length > 0) {
      generateNamesTable(response, "Sapphire");
    }
    hideLoader();
    $("#reloadBtn").removeClass("hidden");
  };
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send();
}

function deleteUser() {
  const nm = deleteMemberName.innerHTML;
  const group = deleteMemberGroup.innerHTML;

  const data = { name: nm, group: group };
  // alert(name);
  // location.href = "/delete?name=" + name;

  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/add/delete");
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(JSON.stringify(data));

  if (group == "SKB") {
    for (let i = 0; i < userJson.length; i++) {
      if (userJson[i].name == nm) {
        // delete userJson[i];
        userJson.splice(i, 1);
        break;
      }
    }
    generateNamesTable(userJson);
  } else {
    for (let i = 0; i < sapphireJson.length; i++) {
      if (sapphireJson[i].name == nm) {
        // delete userJson[i];
        sapphireJson.splice(i, 1);
        break;
      }
    }
    generateNamesTable(sapphireJson, "Sapphire");
  }

  $("#deletePersonName").html(nm);
  $(".delete_alert").removeClass("hide").addClass("show");
  setTimeout(function () {
    $(".delete_alert").removeClass("show").addClass("hide");
  }, 6000);
}

//Session data load

function isTeamDataSession() {
  if (sessionStorage.getItem(`teamData`)) {
    // sessionStorage.setItem(`teamData`, '');
    // console.log(sessionStorage.getItem('teamData'));
    return true;
  } else {
    return false;
  }
}

function setTeamDataSession(jsonData) {
  sessionStorage.setItem(`teamData`, JSON.stringify(jsonData));
}

function getTeamDataSession() {
  const teamDataSession = sessionStorage.getItem('teamData');
  return JSON.parse(teamDataSession);
}

function loadNamesSession() {
  userJson = getTeamDataSession();
  // setTeamDataSession(userJson);
  if (userJson.length > 0) {
    generateNamesTable(userJson);
  }
  hideLoader();
}

if (isTeamDataSession()) {
  loadNamesSession();
} else {
  loadNames();
}

